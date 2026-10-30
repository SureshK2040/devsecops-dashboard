-- ==========================================================
-- DevSecOps Dashboard Platform - V3 Correct Demo Password Hash
-- Updates demo users with valid BCrypt hash for 'password123'
-- ($2a$10$nlWP9a1dVcvgElZoxM6uhuWSbns/XYP1qIEtZQ41XgrKAjT1lrJD2)
-- ==========================================================

UPDATE users 
SET password = '$2a$10$nlWP9a1dVcvgElZoxM6uhuWSbns/XYP1qIEtZQ41XgrKAjT1lrJD2',
    enabled = true
WHERE username IN ('admin', 'manager', 'developer', 'viewer');

