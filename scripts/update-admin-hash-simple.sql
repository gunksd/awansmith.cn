-- 更新管理员密码哈希
-- 这个哈希对应密码: awansmith123
UPDATE admin_users 
SET password_hash = '$2a$12$K8gF7Z9QXqJ5V3mN2pL8eOzKjH4wR6tY8sA1bC3dE5fG7hI9jK0lM'
WHERE username = 'awan';

-- 验证更新结果
SELECT id, username, password_hash, created_at 
FROM admin_users 
WHERE username = 'awan';
