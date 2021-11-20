import {
  FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState,
} from 'react';
import {
  usePost, useSession, useDialog, useAuth,
} from '../hooks';
import { Keep } from '../data/keep';
import { addKeep } from '../api/keep';
import Button from '../components/Button';

const init = '';

const KeepInput = () => {
  const [value, setValue] = useState(init);
  const { session } = useSession();
  const { setDialog } = useDialog();

  const { post } = usePost<{
    keep: Keep;
    uid: string;
  }>(addKeep);

  const { signIn } = useAuth();

  const textareaEl = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaEl.current) {
      textareaEl.current.style.height = 'inherit';
      const { scrollHeight } = textareaEl.current;
      textareaEl.current.style.height = `${scrollHeight}px`;
    }
  }, [value]);

  const disabled = useMemo(() => value === '' || (value !== ''
  && value.replace(/\s/g, '').length === 0), [value]);

  const submit = (e: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    if (!session) {
      setDialog({
        shown: true,
        title: 'サインインが必要な操作です🤖',
        desc: 'テキストを保存するためにサインインしましょう〜',
        action: {
          name: 'Sign In',
          dispatch: signIn,
        },
      });
      return;
    }
    if (disabled) return;
    post({
      keep: { value, userId: session.user.uid },
      uid: session.user.uid,
    });
    setValue(init);
  };

  const enter = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.keyCode === 13 && e.metaKey) {
      e.preventDefault(); // preventDefaultしないと改行が残ってしまう
      submit(e);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="grid gap-2"
    >
      <input type="text" />
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
        className="p-4 rounded-md"
        style={{ resize: 'none' }}
        ref={textareaEl}
        onKeyDown={enter}
      />
      <div className="flex justify-end"><Button type="submit" id="Submit">Submit(⌘ + Enter)</Button></div>
    </form>
  );
};

export default KeepInput;