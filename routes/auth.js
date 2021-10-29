const { Router } = require('express');
const bcrypt = require('bcryptjs');
const router = Router();
const User = require('../models/user');
router.get('/login', async (req, res) => {
  res.render('auth/login', { title: 'Авторизация', isLogin: true, loginError: req.flash('loginError'), registerError: req.flash('registerError') });
});
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const candidate = await User.findOne({ email });

    if (candidate) {
      const areSame = await bcrypt.compare(password, candidate.password);
      if (areSame) {
        req.session.user = candidate;
        req.session.isAuthenticated = true;
        req.session.save((err) => {
          if (err) {
            throw err;
          } else {
            res.redirect('/');
          }
        });
      } else {
        req.flash('loginError', 'Вы ввели неправильный пароль');
        res.redirect('/auth/login#login');
      }
    } else {
      req.flash('loginError', 'Пользователя с такие email нет');
      res.redirect('/auth/login#login');
    }
  } catch (error) {}
});
router.get('/logout', async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login#login');
  });
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, repeat, name } = req.body;
    const candidate = await User.findOne({ email });

    if (candidate) {
      req.flash('registerError', 'Пользователь с таким email уже существует');
      res.redirect('/auth/login#register');
    } else {
      const hashPassword = await bcrypt.hash(password, 10);
      const user = new User({
        email,
        name,
        password: hashPassword,
        cart: { items: [] },
      });
      await user.save();
      res.redirect('/auth/login#login');
    }
  } catch (error) {
    console.log(error);
  }
});
module.exports = router;
