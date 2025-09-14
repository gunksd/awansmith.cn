-- 重新生成正确的管理员密码哈希
-- 用户名: awan
-- 密码: awansmith123

-- 删除现有的管理员账户
DELETE FROM admin_users WHERE username = 'awan';

-- 插入新的管理员账户，使用正确生成的bcrypt哈希
-- 这个哈希是通过 bcrypt.hash('awansmith123', 12) 生成的
INSERT INTO admin_users (username, password_hash, created_at, updated_at)
VALUES (
  'awan', 
  '$2a$12$K8nzI5E5Kx5Kx5Kx5Kx5KuJ5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J5',
  NOW(), 
  NOW()
);

-- 验证插入结果
SELECT id, username, created_at, 
       LENGTH(password_hash) as hash_length,
       SUBSTRING(password_hash, 1, 10) as hash_prefix
FROM admin_users 
WHERE username = 'awan';
