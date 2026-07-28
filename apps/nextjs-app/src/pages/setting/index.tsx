import { Spin } from '@teable/ui-lib/base';
import type { GetServerSideProps } from 'next';
import type { NextPageWithLayout } from '@/lib/type';

const Node: NextPageWithLayout = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Spin className="size-6" />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: `/setting/personal-access-token`,
      permanent: false,
    },
  };
};

export default Node;
