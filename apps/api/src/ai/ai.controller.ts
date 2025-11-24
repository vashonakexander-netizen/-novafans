import { Controller } from "@nestjs/common";
import { AiService } from "./ai.service";

@Controller("ai")
export class AiController {
  constructor(private aiService: AiService) {}

  // This endpoint is mainly for internal use by the worker
  // External AI service calls will go to apps/ai
}

