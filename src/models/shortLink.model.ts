import mongoose, { type Document, type Model, Schema, Types } from 'mongoose';

export interface ShortLinkContract {
  id: string;
  shortLink: string;
  originalLink: string;
}

export interface IShortLink extends Document {
  owner: Types.ObjectId;
  originalLink: string;
  shortLink: string;
  createdAt: Date;
  updatedAt: Date;
  toContract(): ShortLinkContract;
}

const shortLinkSchema = new Schema<IShortLink>(
  {
    owner: {
      type: Schema.Types.ObjectId,
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
shortLinkSchema.methods.toContract = function toContract(this: IShortLink): ShortLinkContract {
  return {
    id: this._id.toString(),
    shortLink: this.shortLink,
    originalLink: this.originalLink,
  };
};

export default mongoose.model<IShortLink, Model<IShortLink>>('ShortLink', shortLinkSchema);
