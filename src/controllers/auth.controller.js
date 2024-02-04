import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const options = {
  httpOnly: true,
  secure: false,
};

export const checkAuth = asyncHandler(async (req, res) => {
  try {
    return res
      .status(200)
      .json(new ApiResponse(200, req.user, "user authorized successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(
      40,
      error?.message || "something went wrong while authorizing user user"
    );
  }
});

export const createUser = asyncHandler(async (req, res, next) => {
  try {
    const userData = req.body;

    const existedUser = await User.findOne({ email: userData?.email });

    if (existedUser) {
      throw new ApiError(409, "user already exists");
    }

    const createdUser = await User.create(req.body);
    if (!createdUser) {
      throw new ApiError(500, "failed to create user");
    }

    const authToken = await createdUser.generateAuthToken();

    const user = await User.findByIdAndUpdate(
      createdUser._id,
      {
        $set: {
          authToken,
        },
      },
      { new: true }
    ).select("_id");

    return res
      .status(201)
      .cookie("authToken", authToken, options)
      .json(new ApiResponse(201, user, "user created successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(
      400,
      error?.message || "something went wrong while creating user"
    );
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  try {
    const userData = req.body;

    const user = await User.findOne({ email: userData?.email });
    if (!user) {
      throw new ApiError(400, "user not found");
    }

    const isValidPassword = await user.isPasswordCorrect(userData?.password);
    if (!isValidPassword) {
      throw new ApiError(400, "invalid user credentials");
    }

    const authToken = await user.generateAuthToken();

    const loggedInUser = await User.findByIdAndUpdate(
      user?._id,
      {
        $set: {
          authToken,
        },
      },
      { new: true }
    ).select("_id");

    return res
      .status(200)
      .cookie("authToken", authToken, options)
      .json(new ApiResponse(200, loggedInUser, "user logged in successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(
      400,
      error?.message || "something went wrong while logging user"
    );
  }
});

export const logoutUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;

    await User.findByIdAndUpdate(
      userId,
      {
        $unset: {
          authToken: 1,
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .clearCookie("authToken", options)
      .json(new ApiResponse(200, {}, "user logged out successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(
      400,
      error?.message || "something went wrong while logging out user"
    );
  }
});

// export const forgotPassword = asyncHandler(async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) {
//       throw new ApiError(400, "email is required");
//     }

//     const user = await User.findOne({ email });
//     if (!user || !user.verified) {
//       throw new ApiError(400, "user not found");
//     }

//     const resetToken = await user.generateResetPasswordToken();
//     const resetURL = `http://localhost:5173/auth/reset-password?token=${resetToken}`;
//     console.log(resetURL);

//     user.resetPasswordToken = resetToken;
//     user.resetPasswordTokenExpiry = Date.now() + 10 * 60 * 1000;
//     await user.save({ validateBeforeSave: false });

//     //send reset url via email
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL,
//         pass: process.env.PASSWORD,
//       },
//     });

//     const mailOptions = {
//       from: process.env.EMAIL,
//       to: email,
//       subject: "Password Reset Request",
//       html: `
//     <p>Hello,</p>
//     <p>We received a request to reset your password. Click the link below to reset it:</p>
//     <p><a href="${resetURL}">${resetURL}</a></p>
//     <p>This link is valid for 10 minutes. Please keep it confidential and do not share it with anyone.</p>
//     <p>Best regards,</p>
//     <p>Talkie Support</p>
//   `,
//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         throw new ApiError(400, error);
//       } else {
//         console.log(info);
//         return res
//           .status(200)
//           .json(new ApiResponse(200, { email }, "otp sent successfully"));
//       }
//     });
//   } catch (error) {
//     console.log(error);
//     throw new ApiError(
//       400,
//       error?.message || "something went wrong while forgetting password"
//     );
//   }
// });

// export const resetPassword = asyncHandler(async (req, res) => {
//   try {
//     const { resetToken, password } = req.body;
//     if (!resetToken || !password) {
//       throw new ApiError(400, "all fields required");
//     }

//     const user = await User.findOne({
//       resetPasswordToken: resetToken,
//       // resetPasswordTokenExipry: { $gt: Date.now() },
//     });
//     if (!user) {
//       throw new ApiError(400, "invalid token");
//     }

//     user.password = password;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordTokenExipry = undefined;
//     user.save({ validateBeforeSave: false });

//     return res
//       .status(200)
//       .json(new ApiResponse(200, {}, "password reset successfully"));
//   } catch (error) {
//     console.log(error);
//     console.log(error);
//     throw new ApiError(
//       400,
//       error?.message || "something went wrong while reseting password"
//     );
//   }
// });

// exports.loginUser = async (req, res) => {
//   const user = req.user;
//   res
//     .cookie("jwt", user.token, {
//       expires: new Date(Date.now() + 3600000),
//       httpOnly: true,
//     })
//     .status(201)
//     .json({ id: user.id, role: user.role });
// };

// exports.logout = async (req, res) => {
//   res
//     .cookie("jwt", null, {
//       expires: new Date(Date.now()),
//       httpOnly: true,
//     })
//     .sendStatus(200);
// };

// exports.checkAuth = async (req, res) => {
//   if (req.user) {
//     res.json(req.user);
//   } else {
//     res.sendStatus(401);
//   }
// };

// exports.resetPasswordRequest = async (req, res) => {
//   const email = req.body.email;
//   const user = await User.findOne({ email: email });
//   if (user) {
//     const token = crypto.randomBytes(48).toString("hex");
//     user.resetPasswordToken = token;
//     await user.save();

//     // Also set token in email
//     const resetPageLink =
//       "http://localhost:3000/reset-password?token=" + token + "&email=" + email;
//     const subject = "reset password for e-commerce";
//     const html = `<p>Click <a href='${resetPageLink}'>here</a> to Reset Password</p>`;

//     // lets send email and a token in the mail body so we can verify that user has clicked right link

//     if (email) {
//       const response = await sendMail({ to: email, subject, html });
//       res.json(response);
//     } else {
//       res.sendStatus(400);
//     }
//   } else {
//     res.sendStatus(400);
//   }
// };

// exports.resetPassword = async (req, res) => {
//   const { email, password, token } = req.body;

//   const user = await User.findOne({ email: email, resetPasswordToken: token });
//   if (user) {
//     const salt = crypto.randomBytes(16);
//     crypto.pbkdf2(
//       req.body.password,
//       salt,
//       310000,
//       32,
//       "sha256",
//       async function (err, hashedPassword) {
//         user.password = hashedPassword;
//         user.salt = salt;
//         await user.save();
//         const subject = "password successfully reset for e-commerce";
//         const html = `<p>Successfully able to Reset Password</p>`;
//         if (email) {
//           const response = await sendMail({ to: email, subject, html });
//           res.json(response);
//         } else {
//           res.sendStatus(400);
//         }
//       }
//     );
//   } else {
//     res.sendStatus(400);
//   }
// };
