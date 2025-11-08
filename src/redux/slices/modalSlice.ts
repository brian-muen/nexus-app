import { createSlice } from '@reduxjs/toolkit';

interface ModalState {
  logInModalOpen: boolean;
  signUpModalOpen: boolean;
}

const initialState: ModalState = {
  logInModalOpen: false,
  signUpModalOpen: false,
};

const modalSlice = createSlice({
  name: 'modals',
  initialState,
  reducers: {
    openLogInModal(state: ModalState) {
      state.logInModalOpen = true;
    },
    closeLogInModal(state: ModalState) {
      state.logInModalOpen = false;
    },
    openSignUpModal(state: ModalState) {
      state.signUpModalOpen = true;
    },
    closeSignUpModal(state: ModalState) {
      state.signUpModalOpen = false;
    },
  },
});

export const {
  openLogInModal,
  closeLogInModal,
  openSignUpModal,
  closeSignUpModal,
} = modalSlice.actions;

export default modalSlice.reducer;