/**
 * Skeleton Loader Components
 * Provides loading placeholders for better perceived performance
 */

import React from 'react';
import { Box, Skeleton, Grid, Card, CardContent, TableCell, TableRow } from '@mui/material';

/**
 * Table Row Skeleton
 */
export const TableRowSkeleton = ({ columns = 5, height = 40 }) => (
  <TableRow>
    {Array.from({ length: columns }).map((_, index) => (
      <TableCell key={index}>
        <Skeleton variant="text" height={height} animation="wave" />
      </TableCell>
    ))}
  </TableRow>
);

/**
 * Table Skeleton - Multiple rows
 */
export const TableSkeleton = ({ rows = 10, columns = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, index) => (
      <TableRowSkeleton key={index} columns={columns} />
    ))}
  </>
);

/**
 * Card Skeleton
 */
export const CardSkeleton = ({ height = 200 }) => (
  <Card sx={{ height, display: 'flex', flexDirection: 'column' }}>
    <CardContent sx={{ flex: 1 }}>
      <Skeleton variant="text" width="60%" height={32} animation="wave" />
      <Skeleton variant="text" width="40%" height={24} sx={{ mt: 1 }} animation="wave" />
      <Skeleton variant="rectangular" height={60} sx={{ mt: 2, borderRadius: 1 }} animation="wave" />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Skeleton variant="text" width="30%" height={20} animation="wave" />
        <Skeleton variant="text" width="30%" height={20} animation="wave" />
      </Box>
    </CardContent>
  </Card>
);

/**
 * Grid of Card Skeletons
 */
export const CardGridSkeleton = ({ count = 6, columns = { xs: 12, sm: 6, md: 4 } }) => (
  <Grid container spacing={2}>
    {Array.from({ length: count }).map((_, index) => (
      <Grid item key={index} {...columns}>
        <CardSkeleton />
      </Grid>
    ))}
  </Grid>
);

/**
 * Dashboard Stats Skeleton
 */
export const StatsSkeleton = ({ count = 4 }) => (
  <Grid container spacing={2}>
    {Array.from({ length: count }).map((_, index) => (
      <Grid item xs={12} sm={6} md={3} key={index}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Skeleton variant="circular" width={48} height={48} animation="wave" />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={24} animation="wave" />
                <Skeleton variant="text" width="40%" height={36} animation="wave" />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

/**
 * List Item Skeleton
 */
export const ListItemSkeleton = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, px: 2 }}>
    <Skeleton variant="circular" width={40} height={40} animation="wave" />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="70%" height={24} animation="wave" />
      <Skeleton variant="text" width="40%" height={20} animation="wave" />
    </Box>
    <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} animation="wave" />
  </Box>
);

/**
 * List Skeleton
 */
export const ListSkeleton = ({ count = 5 }) => (
  <Box>
    {Array.from({ length: count }).map((_, index) => (
      <ListItemSkeleton key={index} />
    ))}
  </Box>
);

/**
 * Form Skeleton
 */
export const FormSkeleton = ({ fields = 4 }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    {Array.from({ length: fields }).map((_, index) => (
      <Box key={index}>
        <Skeleton variant="text" width="30%" height={20} animation="wave" />
        <Skeleton variant="rectangular" height={56} sx={{ mt: 0.5, borderRadius: 1 }} animation="wave" />
      </Box>
    ))}
    <Skeleton variant="rectangular" width="100%" height={44} sx={{ mt: 2, borderRadius: 1 }} animation="wave" />
  </Box>
);

/**
 * Profile Skeleton
 */
export const ProfileSkeleton = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
    <Skeleton variant="circular" width={120} height={120} animation="wave" />
    <Skeleton variant="text" width={200} height={32} animation="wave" />
    <Skeleton variant="text" width={150} height={24} animation="wave" />
    <Box sx={{ width: '100%', mt: 2 }}>
      <FormSkeleton fields={3} />
    </Box>
  </Box>
);

/**
 * Chart Skeleton
 */
export const ChartSkeleton = ({ height = 300 }) => (
  <Box sx={{ width: '100%', height }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
      <Skeleton variant="text" width="30%" height={24} animation="wave" />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} animation="wave" />
        <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} animation="wave" />
      </Box>
    </Box>
    <Skeleton variant="rectangular" height={height - 50} sx={{ borderRadius: 2 }} animation="wave" />
  </Box>
);

/**
 * Page Skeleton - Full page loading
 */
export const PageSkeleton = ({ type = 'dashboard' }) => {
  switch (type) {
    case 'dashboard':
      return (
        <Box sx={{ p: 3 }}>
          <Skeleton variant="text" width={300} height={40} sx={{ mb: 3 }} animation="wave" />
          <StatsSkeleton count={4} />
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={8}>
              <ChartSkeleton />
            </Grid>
            <Grid item xs={12} md={4}>
              <ListSkeleton count={4} />
            </Grid>
          </Grid>
        </Box>
      );
    case 'table':
      return (
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Skeleton variant="text" width={200} height={40} animation="wave" />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Skeleton variant="rectangular" width={200} height={40} sx={{ borderRadius: 1 }} animation="wave" />
              <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} animation="wave" />
            </Box>
          </Box>
          <Card>
            <CardContent>
              <TableSkeleton rows={10} columns={6} />
            </CardContent>
          </Card>
        </Box>
      );
    case 'form':
      return (
        <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
          <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} animation="wave" />
          <Card>
            <CardContent>
              <FormSkeleton fields={6} />
            </CardContent>
          </Card>
        </Box>
      );
    default:
      return (
        <Box sx={{ p: 3 }}>
          <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2 }} animation="wave" />
        </Box>
      );
  }
};

export default {
  TableRowSkeleton,
  TableSkeleton,
  CardSkeleton,
  CardGridSkeleton,
  StatsSkeleton,
  ListItemSkeleton,
  ListSkeleton,
  FormSkeleton,
  ProfileSkeleton,
  ChartSkeleton,
  PageSkeleton,
};

