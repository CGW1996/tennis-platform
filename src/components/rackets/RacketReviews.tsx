import { Button } from '@/components';
import { Review } from '@/types/racket';

interface RacketReviewsProps {
    reviews: Review[];
}

export default function RacketReviews({ reviews }: RacketReviewsProps) {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">用戶評價</h3>
                <Button variant="outline" size="sm">
                    寫評價
                </Button>
            </div>

            <div className="space-y-6">
                {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                                    {review.user_avatar ? (
                                        <img
                                            src={review.user_avatar}
                                            alt={review.user_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-medium">{review.user_name}</h4>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <svg
                                                    key={i}
                                                    className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                                        }`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        {review.verified_purchase && (
                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                                已驗證購買
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <span className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString('zh-TW')}
                            </span>
                        </div>

                        <p className="text-gray-700 mb-4">{review.content}</p>

                        {(review.pros.length > 0 || review.cons.length > 0) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {review.pros.length > 0 && (
                                    <div>
                                        <h5 className="font-medium text-green-700 mb-2">優點：</h5>
                                        <ul className="space-y-1">
                                            {review.pros.map((pro, index) => (
                                                <li key={index} className="text-sm text-gray-600">• {pro}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {review.cons.length > 0 && (
                                    <div>
                                        <h5 className="font-medium text-red-700 mb-2">缺點：</h5>
                                        <ul className="space-y-1">
                                            {review.cons.map((con, index) => (
                                                <li key={index} className="text-sm text-gray-600">• {con}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                {review.helpful_count} 人認為此評價有幫助
                            </div>
                            <Button variant="ghost" size="sm">
                                有幫助
                            </Button>
                        </div>
                    </div>
                ))}

                {reviews.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        尚無用戶評價
                    </div>
                )}
            </div>
        </div>
    );
}
