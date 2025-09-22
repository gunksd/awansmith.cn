-- 创建默认管理员账户
-- 用户名: admin
-- 密码: admin123 (请在生产环境中修改)

INSERT INTO admin_users (username, password_hash, created_at, updated_at)
VALUES (
  'admin',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash for 'admin123'
  NOW(),
  NOW()
)
ON CONFLICT (username) DO NOTHING;

-- 验证管理员账户是否创建成功
SELECT id, username, created_at FROM admin_users WHERE username = 'admin';
