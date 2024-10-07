import DataUsageOutlined from '@mui/icons-material/DataUsageOutlined';
import type { SvgIconProps } from '@mui/material';

const Spinner = ({ sx, ...props }: SvgIconProps) => {
  return (
    <DataUsageOutlined
      sx={{
        animation: 'spin 1s linear infinite',
        '@keyframes spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        ...sx,
      }}
      {...props}
    />
  );
};

export default Spinner;
