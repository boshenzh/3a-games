import { createContext, useContext, useState, type ReactNode } from "react";
import { Button, Dialog } from "@cloudflare/kumo";
import { XIcon } from "@phosphor-icons/react";
import { SubmitForm } from "@/components/SubmitForm.tsx";

type QueryValue = {
  query: string;
  setQuery: (value: string) => void;
};

type SubmitValue = {
  openSubmit: () => void;
};

const QueryContext = createContext<QueryValue | null>(null);
const SubmitContext = createContext<SubmitValue | null>(null);

export function useCatalogQuery(): QueryValue {
  const value = useContext(QueryContext);
  if (!value) throw new Error("Catalog query is only available inside the app shell.");
  return value;
}

export function useSubmitDialog(): SubmitValue {
  const value = useContext(SubmitContext);
  if (!value) throw new Error("Submit dialog is only available inside the app shell.");
  return value;
}

export function AppState({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <QueryContext.Provider value={{ query, setQuery }}>
      <SubmitContext.Provider value={{ openSubmit: () => setOpen(true) }}>
        {children}
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog size="lg" className="p-5 sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-1">
                <Dialog.Title>提交你的游戏 / Submit yours</Dialog.Title>
                <Dialog.Description>
                  留下名称和原作者网址。本站不复制代码，也不转存素材。
                </Dialog.Description>
              </div>
              <Dialog.Close
                render={(props) => (
                  <Button {...props} variant="ghost" shape="square" icon={XIcon} aria-label="关闭" />
                )}
              />
            </div>
            <SubmitForm idPrefix="dialog" />
          </Dialog>
        </Dialog.Root>
      </SubmitContext.Provider>
    </QueryContext.Provider>
  );
}
