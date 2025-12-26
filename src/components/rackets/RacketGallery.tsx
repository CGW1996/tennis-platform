import { useState } from 'react';
import { Racket } from '@/types/racket';

interface RacketGalleryProps {
    racket: Racket;
}

export default function RacketGallery({ racket }: RacketGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);

    return (
        <div>
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 mb-4">
                {racket.images && racket.images.length > 0 ? (
                    <img
                        src={racket.images[selectedImage]}
                        alt={racket.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428l-7.071 7.071-7.071-7.071a2.828 2.828 0 010-4l7.071-7.071 7.071 7.071a2.828 2.828 0 010 4z" />
                        </svg>
                    </div>
                )}
            </div>

            {racket.images && racket.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                    {racket.images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${selectedImage === index ? 'border-emerald-500' : 'border-gray-200'
                                }`}
                        >
                            <img
                                src={image}
                                alt={`${racket.name} ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
