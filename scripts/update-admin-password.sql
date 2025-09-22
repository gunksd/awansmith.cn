-- 更新管理员密码哈希
-- 这个哈希对应密码: awansmith123
UPDATE admin_users 
SET password_hash = '$2a$12$rQv3c1yqBwEHXLAw98qDiOvvHPKHHO.BL25WdRC09NPjdgMRUbYvS'
WHERE username = 'awan';

-- 验证更新
SELECT username, password_hash FROM admin_users WHERE username = 'awan';
