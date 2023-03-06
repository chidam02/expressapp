import mongoose from "mongoose";

export interface IUsers {
  email: string;
  password: string;
}

const UsersSchema = new mongoose.Schema<IUsers>({
  email: { type: String, required: true },
  password: { type: String, required: true },
});

const Users = mongoose.model("users", UsersSchema);

export default Users;
