import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const UserModelSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: Number,
    required: true,
  },
  refreshToken: {
    type: String,
    required: false,
  },
});

const UserModel = mongoose.model('UserModel', UserModelSchema);

const createUser = async (username, password, role) => {
  try {
    const newUser = new UserModel({
      username,
      password,
      role,
    });
    return await newUser.save();
  } catch (err) {
    console.log(`ERROR (DB could not create new user):\n ${err}`);
    return false;
  }
};

const findUser = async (username) => {
  try {
    const users = await UserModel.find({ username });
    if (users.length > 1) {
      // Should not happen, since user is unique key
      return false;
    }
    if (users.length == 0) {
      console.log(`DB user does not exist:\n ${username}`);
      return false;
    }
    return users[0];
  } catch (err) {
    console.log(`ERROR (DB could not find user):\n ${err}`);
    return false;
  }
};

const updateUser = async (user) => {
  try {
    const updatedDocument = await UserModel.findOneAndUpdate(
      { username: user.username }, user, { upsert: 'true' },
    );
    if (!updatedDocument) {
      // Should not happen
      console.log(`DB could not find user to update:\n ${user}`);
      return false;
    }
    return true;
  } catch (err) {
    console.log(`ERROR (DB could not update user):\n ${err}`);
    return err;
  }
};

const deleteUser = async (username) => {
  try {
    const deletedDocument = await UserModel.findOneAndDelete({ username });
    if (!deletedDocument) {
      console.log(`DB could not find user to delete:\n ${username}`);
      return false;
    }
    return true;
  } catch (err) {
    console.log(`ERROR (DB could not delete user):\n ${err}`);
    return false;
  }
};

export default { createUser, deleteUser, findUser, updateUser };
