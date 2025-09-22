-- 直接插入管理员账户的SQL脚本
-- 密码是 'admin123' 的bcrypt哈希值
INSERT INTO admin_users (username, password_hash, created_at)
VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW())
ON CONFLICT (username) DO NOTHING;

-- 验证插入结果
SELECT id, username, created_at FROM admin_users WHERE username = 'admin';
