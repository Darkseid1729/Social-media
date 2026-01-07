import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Tabs,
  Tab,
  Typography,
  CircularProgress,
  Grid,
  Card,
  CardMedia,
  Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  PlayCircleOutline as PlayIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  Collections as AllIcon,
  Forward as ForwardIcon,
} from '@mui/icons-material';
import { useGetChatMediaQuery } from '../../redux/api/api';
import MediaViewer from './MediaViewer';
import ForwardDialog from './ForwardDialog';
import moment from 'moment';

const MediaGallery = ({ open, onClose, chatId }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(null);
  const [forwardDialogOpen, setForwardDialogOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  // Get media type for API query
  const mediaType = activeTab === 'all' ? undefined : activeTab;

  const { data, isLoading, isFetching } = useGetChatMediaQuery(
    { chatId, type: mediaType, page, limit: 50 },
    { skip: !open || !chatId }
  );

  // Reset page when dialog opens or tab changes
  useEffect(() => {
    if (open) {
      setPage(1);
    }
  }, [open, activeTab]);

  // Use media directly from RTK Query (which handles merging via the merge function in api.js)
  const allMedia = data?.media || [];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMediaClick = (index) => {
    setSelectedMediaIndex(index);
  };

  const handleCloseViewer = () => {
    setSelectedMediaIndex(null);
  };

  const handleForwardClick = (e, messageId) => {
    e.stopPropagation();
    setSelectedMessageId(messageId);
    setForwardDialogOpen(true);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const hasMore = data?.pagination?.hasMore;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Media Gallery
          <IconButton onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} centered>
            <Tab
              label="All"
              value="all"
              icon={<AllIcon />}
              iconPosition="start"
            />
            <Tab
              label="Photos"
              value="image"
              icon={<ImageIcon />}
              iconPosition="start"
            />
            <Tab
              label="Videos"
              value="video"
              icon={<VideoIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <DialogContent sx={{ p: 2, overflow: 'auto' }}>
          {isLoading && page === 1 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <CircularProgress />
            </Box>
          ) : allMedia.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 2 }}>
              {activeTab === 'all' && <AllIcon sx={{ fontSize: 64, opacity: 0.3 }} />}
              {activeTab === 'image' && <ImageIcon sx={{ fontSize: 64, opacity: 0.3 }} />}
              {activeTab === 'video' && <VideoIcon sx={{ fontSize: 64, opacity: 0.3 }} />}
              <Typography variant="body1" color="text.secondary">
                No {activeTab === 'all' ? 'media' : activeTab === 'image' ? 'photos' : 'videos'} found
              </Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={1}>
                {allMedia.map((item, index) => {
                  if (!item || !item.type) return null;
                  const isVideo = item.type.startsWith('video/');
                  
                  // Generate thumbnail URL with Cloudinary transformations for faster loading
                  const getThumbnailUrl = (url) => {
                    if (!url) return url;
                    // Add Cloudinary transformation for small thumbnail: 200x200, low quality, auto format
                    if (url.includes('cloudinary.com')) {
                      return url.replace('/upload/', '/upload/w_200,h_200,c_fill,q_auto:low,f_auto/');
                    }
                    return url;
                  };
                  
                  const thumbnailUrl = getThumbnailUrl(item.url);
                  
                  return (
                    <Grid item xs={6} sm={4} md={3} key={`${item._id}-${index}`}>
                      <Card
                        sx={{
                          position: 'relative',
                          cursor: 'pointer',
                          aspectRatio: '1/1',
                          overflow: 'hidden',
                          '&:hover .overlay': {
                            opacity: 1,
                          },
                          '&:hover .forward-btn': {
                            opacity: 1,
                          },
                        }}
                        onClick={() => handleMediaClick(index)}
                      >
                        <CardMedia
                          component={isVideo ? 'video' : 'img'}
                          image={thumbnailUrl}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                        {isVideo && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              color: 'white',
                              pointerEvents: 'none',
                            }}
                          >
                            <PlayIcon sx={{ fontSize: 48, opacity: 0.9 }} />
                          </Box>
                        )}
                        {/* Forward button */}
                        <IconButton
                          className="forward-btn"
                          onClick={(e) => handleForwardClick(e, item.messageId)}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            color: 'white',
                            bgcolor: 'rgba(0, 0, 0, 0.6)',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            '&:hover': {
                              bgcolor: 'rgba(0, 0, 0, 0.8)',
                            },
                          }}
                          size="small"
                        >
                          <ForwardIcon fontSize="small" />
                        </IconButton>
                        <Box
                          className="overlay"
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            bgcolor: 'rgba(0, 0, 0, 0.7)',
                            color: 'white',
                            p: 0.5,
                            opacity: 0,
                            transition: 'opacity 0.2s',
                          }}
                        >
                          <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                            {moment(item.createdAt).format('MMM D, YYYY')}
                          </Typography>
                        </Box>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>

              {hasMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={handleLoadMore}
                    disabled={isFetching}
                  >
                    {isFetching ? <CircularProgress size={24} /> : 'Load More'}
                  </Button>
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Media Viewer */}
      {selectedMediaIndex !== null && (
        <MediaViewer
          open={selectedMediaIndex !== null}
          onClose={handleCloseViewer}
          media={allMedia}
          currentIndex={selectedMediaIndex}
          onNavigate={setSelectedMediaIndex}
        />
      )}

      {/* Forward Dialog */}
      <ForwardDialog
        open={forwardDialogOpen}
        onClose={() => {
          setForwardDialogOpen(false);
          setSelectedMessageId(null);
        }}
        messageId={selectedMessageId}
      />
    </>
  );
};

export default MediaGallery;
