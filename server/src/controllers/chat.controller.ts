import type { Request, Response, NextFunction } from 'express';
import * as chatService from '../services/chat.service';

export async function chat(req: Request, res: Response, next: NextFunction) {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ status: 400, message: 'Message is required' });
      return;
    }

    const conversationHistory = Array.isArray(history) ? history : [];
    const reply = await chatService.getChatReply(message.trim(), conversationHistory);
    res.status(200).json({ reply });
  } catch (err) {
    next(err);
  }
}
