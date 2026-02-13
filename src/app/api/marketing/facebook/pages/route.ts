import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * GET /api/marketing/facebook/pages
 * Get all Facebook Pages accessible by the access token
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: "Missing Facebook Access Token",
      });
    }

    // Get all pages the user/app has access to
    // Use 'me/accounts' to get pages
    const pagesUrl = `https://graph.facebook.com/v21.0/me/accounts?access_token=${accessToken}`;
    
    try {
      const response = await fetch(pagesUrl);
      const data = await response.json();
      
      if (!response.ok) {
        return NextResponse.json({
          success: false,
          error: "Facebook API Error",
          details: data,
        }, { status: response.status });
      }

      // If no pages found, try to get the app page
      if (!data.data || data.data.length === 0) {
        // Try getting page directly by ID
        const pageId = process.env.FACEBOOK_PAGE_ID;
        if (pageId) {
          const pageUrl = `https://graph.facebook.com/v21.0/${pageId}?fields=id,name,access_token,category&access_token=${accessToken}`;
          const pageResponse = await fetch(pageUrl);
          const pageData = await pageResponse.json();
          
          if (pageResponse.ok) {
            return NextResponse.json({
              success: true,
              message: "Found page by ID",
              pages: [pageData],
              currentPageId: pageId,
            });
          } else {
            return NextResponse.json({
              success: false,
              error: "No pages found and cannot access the configured page",
              details: pageData,
              currentPageId: pageId,
            });
          }
        }
        
        return NextResponse.json({
          success: false,
          error: "No Facebook Pages found for this access token",
          hint: "Make sure the access token has 'pages_show_list' and 'pages_read_engagement' permissions",
        });
      }

      return NextResponse.json({
        success: true,
        message: `Found ${data.data.length} page(s)`,
        pages: data.data.map((page: any) => ({
          id: page.id,
          name: page.name,
          category: page.category,
          hasAccessToken: !!page.access_token,
        })),
        currentPageId: process.env.FACEBOOK_PAGE_ID,
      });
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        error: "Failed to connect to Facebook API",
        details: error.message,
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Facebook pages error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || "Failed to fetch Facebook pages" 
      },
      { status: 500 }
    );
  }
}
