import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AIService {
  /**
   * الحصول على توصيات منتجات بناءً على سجل الشراء
   */
  static async getProductRecommendations(
    userId: string,
    products: Array<{ id: string; name: string; nameAr: string; category: string }>
  ) {
    try {
      // في الإنتاج، يمكنك استخدام محرك توصيات أكثر تقدمًا
      // هنا نستخدم OpenAI للحصول على توصيات ذكية

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `أنت مساعد ذكي لمتجر ملابس إلكتروني. مهمتك تقديم توصيات منتجات للعملاء بناءً على اهتماماتهم.`,
          },
          {
            role: 'user',
            content: `قدم لي 5 توصيات منتجات من القائمة التالية. المنتجات: ${JSON.stringify(
              products.map((p) => ({ name: p.nameAr, category: p.category }))
            )}`,
          },
        ],
      });

      return completion.choices[0]?.message?.content || 'لا توجد توصيات متاحة';
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      // في حالة الخطأ، نعيد المنتجات الأكثر مبيعًا
      return null;
    }
  }

  /**
   * بحث ذكي عن المنتجات
   */
  static async smartProductSearch(query: string, products: any[]) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `أنت محرك بحث ذكي لمتجر ملابس. عندما يبحث المستخدم، قم بإرجاع أفضل المنتجات المطابقة. 
            أرجع النتيجة كـ JSON array يحتوي على IDs المنتجات المطابقة فقط.`,
          },
          {
            role: 'user',
            content: `ابحث عن: "${query}". المنتجات المتاحة: ${JSON.stringify(
              products.map((p) => ({
                id: p.id,
                name: p.nameAr,
                description: p.descriptionAr,
              }))
            )}`,
          },
        ],
      });

      const result = completion.choices[0]?.message?.content;
      if (result) {
        try {
          return JSON.parse(result);
        } catch (parseError) {
          console.error('Parse error:', parseError);
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('Error in smart search:', error);
      return null;
    }
  }

  /**
   * إنشاء وصف منتج تلقائي
   */
  static async generateProductDescription(
    productName: string,
    category: string,
    features: string[]
  ) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `أنت كاتب محترف لأوصاف المنتجات في متاجر الملابس. اكتب وصفًا جذابًا ومقنعًا باللغة العربية.`,
          },
          {
            role: 'user',
            content: `اكتب وصفًا احترافيًا للمنتج التالي:
            الاسم: ${productName}
            الفئة: ${category}
            المميزات: ${features.join(', ')}
            
            الوصف يجب أن يكون من 3-4 أسطر فقط، جذاب ومقنع.`,
          },
        ],
      });

      return (
        completion.choices[0]?.message?.content ||
        'وصف المنتج غير متوفر حاليًا'
      );
    } catch (error) {
      console.error('Error generating description:', error);
      return null;
    }
  }

  /**
   * تحليل تعليقات العملاء
   */
  static async analyzeCustomerFeedback(feedbacks: string[]) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `أنت محلل بيانات متخصص في تحليل آراء العملاء. قم بتحليل التعليقات وإعطاء ملخص عن المشاكل الشائعة والإيجابيات.`,
          },
          {
            role: 'user',
            content: `حلل التعليقات التالية وأعطني ملخصًا:
            ${feedbacks.join('\n---\n')}`,
          },
        ],
      });

      return (
        completion.choices[0]?.message?.content || 'لا يوجد تحليل متاح'
      );
    } catch (error) {
      console.error('Error analyzing feedback:', error);
      return null;
    }
  }
}
