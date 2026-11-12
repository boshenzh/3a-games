import { createContext, useContext, useState, type ReactNode } from "react";
import { Button, Dialog } from "@cloudflare/kumo";
import { XIcon } from "@phosphor-icons/react";
import { SubmitForm } from "@/components/SubmitForm.tsx";

type SubmitValue = { openSubmit: () => void };

const SubmitContext = createContext<SubmitValue | null>(null);

export function useSubmitDialog(): SubmitValue {
  const value = useContext(SubmitContext);
  if (!value) throw new Error("Submit dialog is only available inside the app shell.");
  return value;
}

export function AppState({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <SubmitContext.Provider value={{ openSubmit: () => setOpen(true) }}>
      {children}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog size="sm" className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Dialog.Title>提交游戏</Dialog.Title>
            <Dialog.Close
              render={(props) => <Button {...props} variant="ghost" shape="square" size="sm" icon={XIcon} aria-label="关闭" />}
            />
          </div>
          <SubmitForm idPrefix="dialog" onDone={() => setOpen(false)} />
        </Dialog>
      </Dialog.Root>
    </SubmitContext.Provider>
  );
}
