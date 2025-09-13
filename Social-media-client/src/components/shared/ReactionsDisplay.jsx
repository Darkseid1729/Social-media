import React from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';

const ReactionsDisplay = ({ reactions = [], onReactionClick, currentUserId }) => {
  const { theme } = useTheme();

  if (!reactions || reactions.length === 0) return null;

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    const emoji = reaction.emoji;
    if (!acc[emoji]) {
      acc[emoji] = {
        emoji,
        count: 0,
        users: [],
        hasCurrentUser: false
      };
    }
    acc[emoji].count++;
    acc[emoji].users.push(reaction.user);
    if (reaction.user._id === currentUserId) {
      acc[emoji].hasCurrentUser = true;
    }
    return acc;
  }, {});

  const reactionGroups = Object.values(groupedReactions);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '4px', 
        marginTop: '4px',
        marginBottom: '4px'
      }}
    >
      {reactionGroups.map((group) => {
        const userNames = group.users.map(user => user.name || 'Unknown').join(', ');
        const tooltipText = group.count === 1 
          ? userNames 
          : `${userNames} (${group.count})`;

        return (
          <Tooltip key={group.emoji} title={tooltipText} arrow>
            <Chip
              label={`${group.emoji} ${group.count > 1 ? group.count : ''}`}
              size="small"
              clickable
              onClick={() => onReactionClick(group.emoji, group.hasCurrentUser)}
              sx={{
                fontSize: '12px',
                height: '24px',
                backgroundColor: group.hasCurrentUser 
                  ? theme.PRIMARY_COLOR + '20' 
                  : theme.SUBTLE_BG_10,
                color: group.hasCurrentUser 
                  ? theme.PRIMARY_COLOR 
                  : theme.TEXT_SECONDARY,
                border: group.hasCurrentUser 
                  ? `1px solid ${theme.PRIMARY_COLOR}` 
                  : `1px solid ${theme.SUBTLE_BG_20}`,
                '&:hover': {
                  backgroundColor: group.hasCurrentUser 
                    ? theme.PRIMARY_COLOR + '30' 
                    : theme.SUBTLE_BG_20,
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease-in-out',
                '& .MuiChip-label': {
                  paddingLeft: '6px',
                  paddingRight: '6px',
                }
              }}
            />
          </Tooltip>
        );
      })}
    </Box>
  );
};

export default ReactionsDisplay;