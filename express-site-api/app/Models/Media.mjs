import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
const MediaSchema = mongoose.Schema({
    moduleId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    moduleType: {
        type: String,
        required: true
    },
    medias: [
        {
            title: {
                type: String,
                required: true
            },
            source_path: {
                type: String,
                required: false
            },
            file: {
                type: String,
                required: false
            },
            media_type: {
                type: String,
                required: true
            },
            thumbnail_video_id: {
                type: String,
                required: false
            },
            thumbnail: {
                type: String,
                required: false
            },
            seo_title: {
                type: String,
                required: false
            },
            seo_description: {
                type: String,
                required: false
            },
            deletedAt: {
                type: Date,
                default: null
            }
        }
    ],
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

MediaSchema.pre('save', function (next) {
    this.medias.forEach(media => {
        if (media.media_type === 'youtube' || media.media_type === 'youtube_review') {
            media.thumbnail = `https://img.youtube.com/vi/${media.thumbnail_video_id}/maxresdefault.jpg`;
        }
    });
    next();
});
MediaSchema.plugin(mongoosePaginate);

MediaSchema.methods.toJSON = function () {
    const media = this.toObject();
    media.medias = media.medias.map(item => {
        if (item.media_type === 'image') {
            item.sourceImg = item.source_path ? process.env.IMAGE_URL + item.source_path : '';
        }
        return item;
    });
    return media;
};



MediaSchema.set('toJSON', {
    virtuals: true
});

const Media = mongoose.model('medias', MediaSchema);

export { Media };
