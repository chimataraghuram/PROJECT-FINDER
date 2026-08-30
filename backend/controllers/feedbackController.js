import AIInteraction from '../models/AIInteraction.js';

export const submitAIFeedback = async (req, res) => {
  const feedback = req.body.feedback;
  if (!['up', 'down'].includes(feedback)) return res.status(400).json({ message: 'Feedback must be up or down' });
  const interaction = await AIInteraction.findOneAndUpdate({ _id: req.params.interactionId, userId: req.user._id }, { feedback }, { new: true }).lean();
  if (!interaction) return res.status(404).json({ message: 'AI interaction not found' });
  res.json({ id: interaction._id, feedback: interaction.feedback });
};
