import { RadioGroup } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { addKeep } from '../api/keep';
import KeepCard from '../components/KeepCard';
import Button from '../components/Button';
import { Keep } from '../data/keep';
import { useKeeps, usePost, useSession } from '../hooks';
import Link from '../components/Link';

const KeepView = () => {
  const {
    keep, loading, currentStatus, setCurrentStatus,
  } = useKeeps();

  const [selected, setSelected] = useState();
  const { session } = useSession();

  const { query } = useRouter();
  const { groupName: qGroupName } = query as { groupName: string };

  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    setGroupName(qGroupName || '');
  }, [qGroupName]);

  const { post } = usePost<{
    keep: Keep;
    uid: string;
  }>(addKeep);

  if (loading) {
    return (
      <div>
        ...
      </div>
    );
  }

  return (
    <>
      <div className={`pt-12 flex gap-4 ${currentStatus === 'ARCHIVED' ? '' : 'justify-between'}`}>
        <span>
          {' '}
          {(groupName && currentStatus === 'KEEP')
        && (
        <>
          <Link href="/">
            <Button
              id="ARCHIVED"
            >
              ←
            </Button>
          </Link>
          <span className="font-bold text-2xl">{groupName}</span>
        </>
        )}
        </span>
        <Button
          onClick={() => setCurrentStatus((prev) => (prev === 'ARCHIVED' ? 'KEEP' : 'ARCHIVED'))}
          id="ARCHIVED"
        >
          {currentStatus === 'ARCHIVED' ? '←' : 'ARCHIVED' }
        </Button>
        {currentStatus === 'ARCHIVED' && <span className="font-bold text-2xl">ARCHIVED</span>}
      </div>
      <RadioGroup value={selected} onChange={setSelected}>
        <div className="grid gap-4 py-2 grid-cols-2">
          {keep.length === 0 && <>👻</>}
          {keep.map((k) => (
            <RadioGroup.Option
              key={k.id}
              value={k}
            >
              {({ active, checked }) => (
                <>
                  <RadioGroup.Description
                    as={KeepCard}
                    active={active}
                    checked={checked}
                    archive={() => {
                      if (!session) return;
                      post({
                        keep: {
                          ...k,
                          status: k.status === 'ARCHIVED' ? 'KEEP' : 'ARCHIVED',
                        },
                        uid: session.user.uid,
                      });
                    }}
                    keep={k}
                    clipBoard={() => {
                      const textarea = document.createElement('textarea');
                      textarea.value = k.value;
                      document.body.appendChild(textarea);
                      textarea.select();

                      document.execCommand('copy');
                      textarea.parentElement?.removeChild(textarea);
                    }}
                  />
                </>
              )}
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>
    </>
  );
};

export default KeepView;
