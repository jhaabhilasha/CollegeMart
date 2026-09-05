const User = require('../models/user');

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      id: user._id,
      _id: user._id,
      name: user.username,
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      role: user.role || 'user',
      profileImage: user.profileImage || null,
      bio: user.bio || '',
      college: user.college || '',
      studentId: user.studentId || '',
      year: user.year || '',
      department: user.department || '',
      isEmailVerified: user.isEmailVerified,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (updateData.name && !updateData.username) {
      updateData.username = updateData.name;
    }
    delete updateData.password;
    delete updateData.role; // Prevent escalating privilege via profile update
    
    if (updateData.mobile) {
      updateData.mobile = String(updateData.mobile).replace(/\D/g, '');
    }

    const user = await User.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      id: user._id,
      _id: user._id,
      name: user.username,
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      role: user.role || 'user',
      profileImage: user.profileImage || null,
      bio: user.bio || '',
      college: user.college || '',
      studentId: user.studentId || '',
      year: user.year || '',
      department: user.department || '',
      isEmailVerified: user.isEmailVerified,
    });
  } catch (err) {
    if (err.code === 11000) {
      const dupField = Object.keys(err.keyValue || {})[0] || 'field';
      return res.status(400).json({ 
        message: `${dupField.charAt(0).toUpperCase() + dupField.slice(1)} already exists on another account` 
      });
    }
    next(err);
  }
};
