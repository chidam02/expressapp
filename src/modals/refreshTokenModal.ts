import mongoose from "mongoose";

export interface IRefreshToken {
  email: string;
  refreshToken?: string;
}

const RefreshTokenSchema = new mongoose.Schema<IRefreshToken>({
  email: { type: String, required: true },
  refreshToken: { type: String, required: false },
});

const RefreshToken = mongoose.model("refreshToken", RefreshTokenSchema);

export default RefreshToken;
