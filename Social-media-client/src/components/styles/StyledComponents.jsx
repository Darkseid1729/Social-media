import { Skeleton, keyframes, styled } from "@mui/material";
import { Link as LinkComponent } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const VisuallyHiddenInput = styled("input")({
  border: 0,
  clip: "rect(0 0 0 0)",
  height: 1,
  margin: -1,
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  whiteSpace: "nowrap",
  width: 1,
});

const Link = styled(LinkComponent)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.TEXT_PRIMARY,
  padding: '1rem',
  '&:hover': {
    background: theme.SUBTLE_BG_10,
  },
}));

const InputBox = styled("input")(({ theme }) => ({
  width: '100%',
  height: '3.2rem',
  border: `1.5px solid ${theme.SUBTLE_BG_20}`,
  outline: 'none',
  padding: '0 3.5rem',
  borderRadius: '1.5rem',
  background: theme.LIGHT_BG,
  color: theme.TEXT_PRIMARY,
  fontSize: '1.15rem',
  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
  transition: 'border 0.2s, box-shadow 0.2s',
  '&:focus': {
    border: `2px solid ${theme.PRIMARY_COLOR}`,
    boxShadow: '0 4px 12px 0 rgba(0,0,0,0.08)',
  },
  '&:hover': {
    border: `1.5px solid ${theme.PRIMARY_COLOR}`,
  },
}));

const SearchField = styled("input")(({ theme }) => ({
  padding: '1rem 2rem',
  width: '20vmax',
  border: 'none',
  outline: 'none',
  borderRadius: '1.5rem',
  background: theme.LIGHT_BG,
  color: theme.TEXT_PRIMARY,
  fontSize: '1.1rem',
}));

const CurveButton = styled("button")(({ theme }) => ({
  borderRadius: '1.5rem',
  padding: '1rem 2rem',
  border: 'none',
  outline: 'none',
  cursor: 'pointer',
  background: theme.SURFACE_BG,
  color: theme.TEXT_PRIMARY,
  fontSize: '1.1rem',
  '&:hover': {
    background: theme.SUBTLE_BG_20,
  },
}));

const bounceAnimation = keyframes`
0% { transform: scale(1); }
25% { transform: scale(0.75); }
50% { transform: scale(0.5); }
75% { transform: scale(1.5); }
100% { transform: scale(1); }
`;

const BouncingSkeleton = styled(Skeleton)(() => ({
  animation: `${bounceAnimation} 0.5s infinite`,
}));

export {
  CurveButton,
  SearchField,
  InputBox,
  Link,
  VisuallyHiddenInput,
  BouncingSkeleton,
};
