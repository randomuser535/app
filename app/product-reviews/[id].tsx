import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Image,
  StyleSheet,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Star, ThumbsUp, ThumbsDown, Filter, ChevronDown, Camera, X } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import Header from '@/components/Header';
import Button from '@/components/Button';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verified: boolean;
  helpful: number;
  notHelpful: number;
  images?: string[];
  userHasVoted?: 'helpful' | 'not-helpful' | null;
}

interface ReviewForm {
  rating: number;
  title: string;
  content: string;
  images: string[];
}

const mockReviews: Review[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Sarah Johnson',
    userAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    rating: 5,
    title: 'Absolutely love this phone!',
    content: 'The camera quality is incredible and the battery life exceeds my expectations. The build quality feels premium and the performance is smooth. Highly recommend for anyone looking for a flagship device.',
    date: '2024-01-15',
    verified: true,
    helpful: 24,
    notHelpful: 2,
    images: [
      'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=400',
    ],
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Mike Chen',
    rating: 4,
    title: 'Great phone with minor issues',
    content: 'Overall very satisfied with the purchase. The display is beautiful and the performance is excellent. Only complaint is that it gets a bit warm during heavy gaming sessions.',
    date: '2024-01-10',
    verified: true,
    helpful: 18,
    notHelpful: 5,
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Emily Davis',
    userAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    rating: 3,
    title: 'Good but not great',
    content: 'The phone is decent but I expected more for the price. The camera is good in daylight but struggles in low light conditions. Battery life is average.',
    date: '2024-01-08',
    verified: true,
    helpful: 12,
    notHelpful: 8,
  },
];

export default function ProductReviewsScreen() {
  const { id } = useLocalSearchParams();
  const { state } = useApp();
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    rating: 0,
    title: '',
    content: '',
    images: [],
  });
  const [formErrors, setFormErrors] = useState<Partial<ReviewForm>>({});

  const product = state.products.find(p => p.id === id);
  
  // Check if user has purchased this product (mock check)
  const hasPurchased = true; // In real app, check order history
  const hasReviewed = reviews.some(r => r.userId === state.user?.id);

  const filteredAndSortedReviews = useMemo(() => {
    let filtered = reviews;
    
    if (filterRating) {
      filtered = filtered.filter(r => r.rating === filterRating);
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        case 'helpful':
          return b.helpful - a.helpful;
        default:
          return 0;
      }
    });
  }, [reviews, sortBy, filterRating]);

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: (reviews.filter(r => r.rating === rating).length / reviews.length) * 100,
  }));

  const validateReviewForm = (): boolean => {
    const errors: Partial<ReviewForm> = {};
    
    if (reviewForm.rating === 0) {
      errors.rating = 'Please select a rating';
    }
    
    if (!reviewForm.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!reviewForm.content.trim()) {
      errors.content = 'Review content is required';
    } else if (reviewForm.content.trim().length < 20) {
      errors.content = 'Review must be at least 20 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitReview = () => {
    if (!validateReviewForm()) return;
    
    const newReview: Review = {
      id: Date.now().toString(),
      userId: state.user?.id || 'current-user',
      userName: state.user?.name || 'Anonymous',
      userAvatar: state.user?.avatar,
      rating: reviewForm.rating,
      title: reviewForm.title,
      content: reviewForm.content,
      date: new Date().toISOString().split('T')[0],
      verified: hasPurchased,
      helpful: 0,
      notHelpful: 0,
      images: reviewForm.images,
    };
    
    setReviews(prev => [newReview, ...prev]);
    setShowWriteReview(false);
    setReviewForm({ rating: 0, title: '', content: '', images: [] });
    Alert.alert('Success', 'Your review has been submitted!');
  };

  const handleVoteHelpful = (reviewId: string, isHelpful: boolean) => {
    setReviews(prev => prev.map(review => {
      if (review.id === reviewId) {
        const currentVote = review.userHasVoted;
        let helpful = review.helpful;
        let notHelpful = review.notHelpful;
        let newVote: 'helpful' | 'not-helpful' | null = null;
        
        // Remove previous vote if exists
        if (currentVote === 'helpful') helpful--;
        if (currentVote === 'not-helpful') notHelpful--;
        
        // Add new vote if different from current
        if (currentVote !== (isHelpful ? 'helpful' : 'not-helpful')) {
          if (isHelpful) {
            helpful++;
            newVote = 'helpful';
          } else {
            notHelpful++;
            newVote = 'not-helpful';
          }
        }
        
        return {
          ...review,
          helpful,
          notHelpful,
          userHasVoted: newVote,
        };
      }
      return review;
    }));
  };

  const handleAddPhoto = () => {
    // In a real app, this would open camera/gallery
    Alert.alert('Add Photo', 'Camera/Gallery functionality would be implemented here');
  };

  const renderStarRating = (rating: number, size: number = 16, interactive: boolean = false) => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            disabled={!interactive}
            onPress={() => interactive && setReviewForm(prev => ({ ...prev, rating: star }))}
          >
            <Star
              size={size}
              color={star <= rating ? '#FFC107' : '#E2E8F0'}
              fill={star <= rating ? '#FFC107' : 'none'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderRatingDistribution = () => (
    <View style={styles.ratingDistribution}>
      <View style={styles.averageRating}>
        <Text style={styles.averageNumber}>{averageRating.toFixed(1)}</Text>
        {renderStarRating(Math.round(averageRating), 20)}
        <Text style={styles.totalReviews}>{reviews.length} reviews</Text>
      </View>
      
      <View style={styles.distributionBars}>
        {ratingDistribution.map(({ rating, count, percentage }) => (
          <TouchableOpacity
            key={rating}
            style={styles.distributionRow}
            onPress={() => setFilterRating(filterRating === rating ? null : rating)}
          >
            <Text style={styles.ratingNumber}>{rating}</Text>
            <Star size={12} color="#FFC107" fill="#FFC107" />
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${percentage}%` }]} />
            </View>
            <Text style={styles.ratingCount}>{count}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderReview = (review: Review) => (
    <View key={review.id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          {review.userAvatar ? (
            <Image source={{ uri: review.userAvatar }} style={styles.reviewerAvatar} />
          ) : (
            <View style={styles.reviewerAvatarPlaceholder}>
              <Text style={styles.reviewerInitial}>
                {review.userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.reviewerDetails}>
            <View style={styles.reviewerNameRow}>
              <Text style={styles.reviewerName}>{review.userName}</Text>
              {review.verified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>Verified Purchase</Text>
                </View>
              )}
            </View>
            <Text style={styles.reviewDate}>
              {new Date(review.date).toLocaleDateString()}
            </Text>
          </View>
        </View>
        {renderStarRating(review.rating)}
      </View>
      
      <Text style={styles.reviewTitle}>{review.title}</Text>
      <Text style={styles.reviewContent}>{review.content}</Text>
      
      {review.images && review.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewImages}>
          {review.images.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.reviewImage} />
          ))}
        </ScrollView>
      )}
      
      <View style={styles.reviewActions}>
        <Text style={styles.helpfulText}>Was this helpful?</Text>
        <View style={styles.voteButtons}>
          <TouchableOpacity
            style={[
              styles.voteButton,
              review.userHasVoted === 'helpful' && styles.activeVoteButton,
            ]}
            onPress={() => handleVoteHelpful(review.id, true)}
          >
            <ThumbsUp 
              size={16} 
              color={review.userHasVoted === 'helpful' ? '#FFFFFF' : '#64748B'} 
            />
            <Text style={[
              styles.voteText,
              review.userHasVoted === 'helpful' && styles.activeVoteText,
            ]}>
              {review.helpful}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.voteButton,
              review.userHasVoted === 'not-helpful' && styles.activeVoteButton,
            ]}
            onPress={() => handleVoteHelpful(review.id, false)}
          >
            <ThumbsDown 
              size={16} 
              color={review.userHasVoted === 'not-helpful' ? '#FFFFFF' : '#64748B'} 
            />
            <Text style={[
              styles.voteText,
              review.userHasVoted === 'not-helpful' && styles.activeVoteText,
            ]}>
              {review.notHelpful}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderWriteReviewForm = () => (
    <View style={styles.writeReviewForm}>
      <Text style={styles.formTitle}>Write a Review</Text>
      
      {/* Rating */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Rating *</Text>
        {renderStarRating(reviewForm.rating, 24, true)}
        {formErrors.rating && <Text style={styles.errorText}>{formErrors.rating}</Text>}
      </View>
      
      {/* Title */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Review Title *</Text>
        <TextInput
          style={[styles.formInput, formErrors.title && styles.inputError]}
          value={reviewForm.title}
          onChangeText={(text) => {
            setReviewForm(prev => ({ ...prev, title: text }));
            if (formErrors.title) setFormErrors(prev => ({ ...prev, title: undefined }));
          }}
          placeholder="Summarize your experience"
          maxLength={100}
        />
        {formErrors.title && <Text style={styles.errorText}>{formErrors.title}</Text>}
      </View>
      
      {/* Content */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Your Review * (minimum 20 characters)</Text>
        <TextInput
          style={[styles.formTextArea, formErrors.content && styles.inputError]}
          value={reviewForm.content}
          onChangeText={(text) => {
            setReviewForm(prev => ({ ...prev, content: text }));
            if (formErrors.content) setFormErrors(prev => ({ ...prev, content: undefined }));
          }}
          placeholder="Share your thoughts about this product..."
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          maxLength={1000}
        />
        <Text style={styles.characterCount}>
          {reviewForm.content.length}/1000 characters
        </Text>
        {formErrors.content && <Text style={styles.errorText}>{formErrors.content}</Text>}
      </View>
      
      {/* Photo Upload */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Add Photos (Optional)</Text>
        <TouchableOpacity style={styles.photoUpload} onPress={handleAddPhoto}>
          <Camera size={24} color="#64748B" />
          <Text style={styles.photoUploadText}>Add photos to your review</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.formActions}>
        <Button
          title="Cancel"
          onPress={() => {
            setShowWriteReview(false);
            setReviewForm({ rating: 0, title: '', content: '', images: [] });
            setFormErrors({});
          }}
          variant="outline"
          
        />
        <Button
          title="Submit Review"
          onPress={handleSubmitReview}
        />
      </View>
    </View>
  );

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Product not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Reviews"
        showBackButton
        onBackPress={() => router.back()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Info */}
        <View style={styles.productInfo}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          <View style={styles.productDetails}>
            <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
            <Text style={styles.productBrand}>{product.brand}</Text>
          </View>
        </View>

        {/* Rating Overview */}
        {renderRatingDistribution()}

        {/* Controls */}
        <View style={styles.controls}>
          <View style={styles.controlsLeft}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} color="#64748B" />
              <Text style={styles.filterButtonText}>Filter</Text>
              <ChevronDown size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          {hasPurchased && !hasReviewed && (
            <Button
              title="Write Review"
              onPress={() => setShowWriteReview(true)}
              size="small"
            />
          )}
        </View>

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersPanel}>
            <Text style={styles.filterTitle}>Sort by:</Text>
            <View style={styles.sortOptions}>
              {[
                { key: 'newest', label: 'Newest' },
                { key: 'oldest', label: 'Oldest' },
                { key: 'highest', label: 'Highest Rating' },
                { key: 'lowest', label: 'Lowest Rating' },
                { key: 'helpful', label: 'Most Helpful' },
              ].map(({ key, label }) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.sortOption,
                    sortBy === key && styles.activeSortOption,
                  ]}
                  onPress={() => setSortBy(key as any)}
                >
                  <Text style={[
                    styles.sortOptionText,
                    sortBy === key && styles.activeSortOptionText,
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {filterRating && (
              <TouchableOpacity
                style={styles.clearFilter}
                onPress={() => setFilterRating(null)}
              >
                <X size={16} color="#EF4444" />
                <Text style={styles.clearFilterText}>Clear rating filter</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Write Review Form */}
        {showWriteReview && renderWriteReviewForm()}

        {/* Reviews List */}
        <View style={styles.reviewsList}>
          <Text style={styles.reviewsTitle}>
            {filteredAndSortedReviews.length} Review{filteredAndSortedReviews.length !== 1 ? 's' : ''}
            {filterRating && ` (${filterRating} star${filterRating !== 1 ? 's' : ''})`}
          </Text>
          {filteredAndSortedReviews.map(renderReview)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  productInfo: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  productDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  ratingDistribution: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  averageRating: {
    alignItems: 'center',
    marginBottom: 20,
  },
  averageNumber: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 8,
  },
  distributionBars: {
    gap: 8,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingNumber: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
    width: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFC107',
  },
  ratingCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    width: 20,
    textAlign: 'right',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  controlsLeft: {
    flex: 1,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignSelf: 'flex-start',
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginHorizontal: 8,
  },
  filtersPanel: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 12,
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeSortOption: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  sortOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  activeSortOptionText: {
    color: '#FFFFFF',
  },
  clearFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  clearFilterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#EF4444',
    marginLeft: 4,
  },
  writeReviewForm: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  formTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  formTextArea: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    height: 120,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#EF4444',
    marginTop: 4,
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'right',
    marginTop: 4,
  },
  photoUpload: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  photoUploadText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginLeft: 8,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  reviewsList: {
    padding: 20,
  },
  reviewsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 16,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerInitial: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  reviewerDetails: {
    marginLeft: 12,
    flex: 1,
  },
  reviewerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  verifiedBadge: {
    backgroundColor: '#10B981',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  verifiedText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  reviewDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  starContainer: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 23,
  },
  reviewTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 8,
  },
  reviewContent: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewImages: {
    marginBottom: 12,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  reviewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  helpfulText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  voteButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeVoteButton: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  voteText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginLeft: 4,
  },
  activeVoteText: {
    color: '#FFFFFF',
  },
});