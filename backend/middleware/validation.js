const validateUser = (req, res, next) => {
  const { name, email, password, address, role } = req.body;
  const errors = [];
  
  console.log('Validation input:', { name, email, password: '***', address, role }); 

  if (!name) {
    errors.push('Name is required');
  } else if (name.length < 3) { 
    errors.push('Name must be at least 3 characters');
  } else if (name.length > 60) {
    errors.push('Name must be no more than 60 characters');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors.push('Email is required');
  } else if (!emailRegex.test(email)) {
    errors.push('Valid email is required');
  }
  
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,20}$/; 
  if (!password) {
    errors.push('Password is required');
  } else if (!passwordRegex.test(password)) {
    errors.push('Password must be 6-20 characters with at least one uppercase letter and one special character (!@#$%^&*)');
  }

  if (!address) {
    errors.push('Address is required');
  } else if (address.length > 400) {
    errors.push('Address must be less than 400 characters');
  }
  
  const allowedRoles = ['user', 'admin', 'store_owner'];
  if (role && !allowedRoles.includes(role)) {
    errors.push('Invalid role');
  }
  
  if (errors.length > 0) {
    console.log('Validation errors:', errors);
    return res.status(400).json({ errors });
  }
  
  next();
};

module.exports = { validateUser };