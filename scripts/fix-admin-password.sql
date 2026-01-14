-- 修复admin用户密码
UPDATE users SET password='$2a$10$s4lC5WQUSGKXlw2AQL1zBO33DgC/nGHCqHXx1z3Kb/sQ/xtAM9zj6' WHERE username='admin';
SELECT username, password FROM users WHERE username='admin';
