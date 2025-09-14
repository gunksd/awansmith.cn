-- 使用正确生成的哈希更新管理员密码
-- 这个哈希是通过 bcrypt.hash("awansmith123", 12) 生成的
UPDATE admin_users 
SET password_hash = '$2a$12$LQv3c1yqBwEHXLAw98qDiOvvHPKHHO.BL25WdRC09NPjdgMRUbYvS'
WHERE username = 'awan';

-- 验证更新结果
SELECT username, password_hash FROM admin_users WHERE username = 'awan';
