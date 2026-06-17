import mongoose from 'mongoose';

const shortLinkSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalLink: {
      type: String,
      required: true,
    },
    shortLink: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Serialize to the shape defined by the API contract: { id, shortLink, originalLink }.
shortLinkSchema.methods.toContract = function toContract() {
  return {
    id: this._id.toString(),
    shortLink: this.shortLink,
    originalLink: this.originalLink,
  };
};

export default mongoose.model('ShortLink', shortLinkSchema);
