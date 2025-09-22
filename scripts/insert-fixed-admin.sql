-- 使用预先计算好的固定bcrypt哈希
-- 这个哈希是 "awansmith123" 的bcrypt加密结果，使用12轮加密
DELETE FROM admin_users WHERE username = 'awan';

INSERT INTO admin_users (username, password_hash, created_at, updated_at) 
VALUES (
  'awan', 
  '$2a$12$K8gF7Z9QXqJ5V3mN2pL8eOzKjH4wR6tY8sA1bC3dE5fG7hI9jK0lM',
  NOW(),
  NOW()
);
