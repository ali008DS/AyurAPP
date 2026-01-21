import { configureStore } from "@reduxjs/toolkit";
import { userRoleSlice } from "./slices/user-role";
export const store = configureStore({
  reducer: {
    userRole: userRoleSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
