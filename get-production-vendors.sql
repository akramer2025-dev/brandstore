-- جيب كل حسابات الـ Vendor من Production
SELECT u.email, u.name, v."businessNameAr", v."isApproved", v."isActive"
FROM users u
INNER JOIN vendors v ON u.id = v."userId"
WHERE u.role = 'VENDOR'
ORDER BY u."createdAt" DESC
LIMIT 5;
