import { SelectOption } from "../../backend/src/database/schemas";
import { SelectPoll } from "../../backend/src/database/schemas/poll/poll.table";
import { SelectQuestion } from "./question";

export type SelectPollWithQuestionAndOptions = SelectPoll & {
  question: SelectQuestion & { options: SelectOption[] };
};

export type PollResults = {
  optionId: string;
  optionText: string;
  count: number;
  percentage: number;
  isCorrect: boolean;
};

export type SelectPollWithResults = SelectPoll & {
  finalResults?: PollResults[];
};

export type { SelectPoll };
