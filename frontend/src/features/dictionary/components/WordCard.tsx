import { Card, CardActionArea, CardContent, Typography } from '@mui/material';

type Props = {
  word: string;
  onClick: () => void;
};

export function WordCard({ word, onClick }: Props) {
  return (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        transition: '0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
        },
      }}>
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {word}
          </Typography>

          <Typography color="text.secondary" variant="body2">
            View details
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
