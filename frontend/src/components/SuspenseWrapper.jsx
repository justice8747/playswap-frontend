import { Suspense } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';

function SuspenseWrapper({ children }) {
  return <Suspense fallback={<LoadingSpinner fullScreen={true} />}>{children}</Suspense>;
}

export default SuspenseWrapper;
