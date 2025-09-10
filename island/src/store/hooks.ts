import { useDispatch, useSelector } from "react-redux";
import type { ToDoRootState, ToDoAppDispatch } from "./store";

export const useToDoDispatch = () => useDispatch<ToDoAppDispatch>();
export const useToDoSelector = <T>(selector: (state: ToDoRootState) => T): T =>
  useSelector(selector);