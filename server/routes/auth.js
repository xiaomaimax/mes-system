const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const { asyncHandler, AuthenticationError, ValidationError } = require('../middleware/errorHandler');
const { createValidationMiddleware, validationRules } = require('../middleware/validation');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// 验证JWT_SECRET是否存在
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET环境变量未设置');
}

// 用户登录
router.post('/login', 
  createValidationMiddleware({
    username: validationRules.username,
    password: validationRules.password
  }),
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username, is_active: true } });
    if (!user) {
      logger.warn('登录失败 - 用户不存在', { username });
      throw new AuthenticationError('用户名或密码错误');
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      logger.warn('登录失败 - 密码错误', { username });
      throw new AuthenticationError('用户名或密码错误');
    }

    // 更新最后登录时间
    await user.update({ last_login: new Date() });

    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    logger.info('用户登录成功', { userId: user.id, username: user.username });

    res.json({
      success: true,
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        department: user.department
      }
    });
  })
);

// 用户注册
router.post('/register',
  createValidationMiddleware({
    username: validationRules.username,
    password: validationRules.password,
    email: validationRules.email
  }),
  asyncHandler(async (req, res) => {
    const { username, password, email, full_name, role, department } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      logger.warn('注册失败 - 用户已存在', { username });
      throw new ValidationError('用户已存在', ['该用户名已被使用']);
    }

    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      logger.warn('注册失败 - 邮箱已存在', { email });
      throw new ValidationError('邮箱已存在', ['该邮箱已被使用']);
    }

    // 创建新用户
    const newUser = await User.create({
      username,
      password,
      email,
      full_name: full_name || username,
      role: role || 'operator',
      department: department || '未分配',
      is_active: true
    });

    logger.info('用户注册成功', { userId: newUser.id, username: newUser.username });

    res.status(201).json({
      success: true,
      message: '注册成功',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role
      }
    });
  })
);

// 验证token中间件
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn('认证失败 - 缺少token', { path: req.path });
    return res.status(401).json({
      success: false,
      message: '缺少认证token'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn('认证失败 - token无效', { path: req.path, error: err.message });
      return res.status(403).json({
        success: false,
        message: 'token无效或已过期'
      });
    }

    req.user = user;
    next();
  });
}

// 获取当前用户信息
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.userId, {
    attributes: { exclude: ['password'] }
  });
  
  if (!user) {
    throw new ValidationError('用户不存在', ['该用户不存在']);
  }

  res.json({ 
    success: true,
    user: {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      department: user.department,
      email: user.email
    }
  });
}));

module.exports = { router, authenticateToken };