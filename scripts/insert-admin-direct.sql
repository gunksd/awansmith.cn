-- 直接插入管理员账户（使用预计算的bcrypt哈希）
-- 用户名: awan
-- 密码: awansmith123

INSERT INTO admin_users (username, password_hash, created_at, updated_at)
VALUES (
  'awan', 
  '$2a$12$LQv3c1yqBwEHXLAw98qDiOvvHPKHHO.BL25WdRC09NPjdgMRUbYvS',
  NOW(), 
  NOW()
)
ON CONFLICT (username) DO UPDATE SET
  password_hash = '$2a$12$LQv3c1yqBwEHXLAw98qDiOvvHPKHHO.BL25WdRC09NPjdgMRUbYvS',
  updated_at = NOW();

-- 验证插入结果
SELECT id, username, created_at, 
       LENGTH(password_hash) as hash_length,
       SUBSTRING(password_hash, 1, 10) as hash_prefix
FROM admin_users 
WHERE username = 'awan';
