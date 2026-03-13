import { useFrame, useThree } from '@react-three/fiber';
import { RefObject } from 'react';

const MyBillboard = ({
  objectRef
}: {
  objectRef: RefObject<any>
}) => {
  const { camera } = useThree();
  useFrame(() => {
    if (objectRef.current) {
      objectRef.current.lookAt(camera.position);
    }
  });

  return null;
};

export default MyBillboard;