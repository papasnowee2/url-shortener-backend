import mongoose from 'mongoose';
import ShortLink, { type IShortLink } from '../models/shortLink.model.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { urlBodySchema } from '../validators/shortner.validator.js';
import { createShortUrl } from '../services/shortener.service.js';

// Finds an owned link, enforcing: valid id -> exists -> ownership.
// `notOwnerStatus` differs per the contract (400 on update, 403 on delete).
async function findOwnedLink(
  id: string,
  userId: string,
  notOwnerStatus: number
): Promise<IShortLink> {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, 'Invalid short link ID');
  }

  const link = await ShortLink.findById(id);
  if (!link) {
    throw new AppError(404, 'Short link not found');
  }

  if (link.owner.toString() !== userId) {
    throw new AppError(notOwnerStatus, 'You are not the owner of this link');
  }

  return link;
}

// POST /shortner -> create a short link for the current user
const create = asyncHandler(async (req, res) => {
  const { url } = urlBodySchema.parse(req.body);

  const shortLink = await createShortUrl(url);
  const link = await ShortLink.create({
    owner: req.user.id,
    originalLink: url,
    shortLink,
  });

  res.status(201).json(link.toContract());
});

// GET /shortner -> list the current user's short links
const list = asyncHandler(async (req, res) => {
  const links = await ShortLink.find({ owner: req.user.id }).sort({
    createdAt: -1,
  });

  res.status(200).json(links.map((l) => l.toContract()));
});

// PATCH /shortner/:id -> regenerate the short link for a new destination URL
const update = asyncHandler(async (req, res) => {
  const { url } = urlBodySchema.parse(req.body);
  const linkId = req.params.id;
  if (typeof linkId !== 'string') {
    throw new AppError(400, 'Invalid short link ID');
  }
  const link = await findOwnedLink(linkId, req.user.id, 400);

  link.originalLink = url;
  link.shortLink = await createShortUrl(url);
  await link.save();

  res.status(200).json(link.toContract());
});

// DELETE /shortner/:id -> remove a short link, return its id
const remove = asyncHandler(async (req, res) => {
  const linkId = req.params.id;
  if (typeof linkId !== 'string') {
    throw new AppError(400, 'Invalid short link ID');
  }
  const link = await findOwnedLink(linkId, req.user.id, 403);
  await link.deleteOne();

  res.status(200).json({ id: link._id.toString() });
});

export { create, list, update, remove };
