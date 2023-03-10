import Copy from "@components/Copy";
import { NodeManagerContext } from "@components/GlobalStateProvider";
import MutinyToaster from "@components/MutinyToaster";
import SettingStringsEditor from "@components/SettingStringsEditor";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toastAnything } from "@util/dumb";
import { useContext, useState } from "react";
import Close from "../components/Close";
import PageTitle from "../components/PageTitle";
import { ReactComponent as Eye } from "../images/icons/eye.svg";
import { ReactComponent as EyeClosed } from "../images/icons/eye-closed.svg";
import { mainWrapperStyle } from "../styles";
import ConfirmDialog from "@components/ConfirmDialog";

const COMMIT_HASH = process.env.REACT_APP_COMMIT_HASH || "";

function SeedWords({ words }: { words: string }) {
  const [shouldShow, setShouldShow] = useState(false);

  function toggleShow() {
    setShouldShow(!shouldShow);
  }

  return (
    <pre className="flex items-center gap-4">
      {shouldShow ? (
        <>
          <div onClick={toggleShow} className="cursor-pointer">
            <Eye />
          </div>
          <code>{words}</code>
        </>
      ) : (
        <>
          <div onClick={toggleShow} className="cursor-pointer">
            <EyeClosed />
          </div>
          <code className="text-red">TAP TO REVEAL SEED WORDS</code>
        </>
      )}
    </pre>
  );
}

function Settings() {
  const { nodeManager } = useContext(NodeManagerContext);
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [newStorage, setNewStorage] = useState<any>(null);

  const { data: words } = useQuery({
    queryKey: ["words"],
    queryFn: () => {
      console.log("Getting mnemonic...");
      return nodeManager?.show_seed();
    },
    enabled: !!nodeManager,
  });

  const { data: nodes } = useQuery({
    queryKey: ["nodes"],
    queryFn: () => {
      console.log("Getting nodes...");
      return nodeManager?.list_nodes();
    },
    enabled: !!nodeManager,
  });

  function handleSave() {
    let serializable: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      serializable[key!] = localStorage.getItem(key!);
    }
    console.log(serializable);

    saveTemplateAsFile("mutiny_wallet_backup.json", serializable);
  }

  // https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
  const saveTemplateAsFile = (
    filename: string,
    dataObjToWrite: Record<string, any>
  ) => {
    const blob = new Blob([JSON.stringify(dataObjToWrite)], {
      type: "text/json",
    });
    const link = document.createElement("a");

    link.download = filename;
    link.href = window.URL.createObjectURL(blob);
    link.dataset.downloadurl = ["text/json", link.download, link.href].join(
      ":"
    );

    const evt = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });

    link.dispatchEvent(evt);
    link.remove();
  };

  function handleClearState() {
    setConfirmMessage(
      "Are you sure you want to clear your node's state? This can't be undone!"
    );
    setDialogOpen(true);
  }

  async function handleFileChoose(e: React.ChangeEvent) {
    const fileReader = new FileReader();
    const target = e.target as HTMLInputElement;

    try {
      const file: File = (target.files as FileList)[0];
      fileReader.readAsText(file, "UTF-8");
      fileReader.onload = (e) => {
        const text = e.target?.result?.toString();

        // This should throw if there's a parse error, so we won't end up clearing
        const parsedNewStorage = JSON.parse(text!);

        console.log(parsedNewStorage);

        setNewStorage(parsedNewStorage);

        setConfirmMessage(
          "Are you sure you want to replace your node's state? This can't be undone!"
        );
        setDialogOpen(true);
      };
    } catch (e) {
      console.error(e);
    }
  }

  function confirmSettingsAction() {
    // This is a kind of dumb way to tell which action to take
    if (
      confirmMessage ===
      "Are you sure you want to replace your node's state? This can't be undone!"
    ) {
      localStorage.clear();
      Object.entries(newStorage).forEach(([key, value]) => {
        localStorage.setItem(key, value as string);
      });
      window.location.reload();
    } else if (
      confirmMessage ===
      "Are you sure you want to clear your node's state? This can't be undone!"
    ) {
      console.log("Clearing local storage... So long, state!");
      localStorage.clear();
      window.location.reload();
    }
    setDialogOpen(false);
  }

  async function handleNewNode() {
    try {
      await nodeManager?.new_node();
      await queryClient.invalidateQueries({ queryKey: ["nodes"] });
    } catch (e) {
      console.error(e);
      toastAnything(e);
    }
  }

  return (
    <>
      <header className="px-8 pt-8 flex justify-between items-center">
        <PageTitle title="Settings" theme="red" />
        <Close />
      </header>
      <main className={mainWrapperStyle({ padSides: "no" })}>
        <div className="flex flex-col gap-4 flex-1 overflow-y-scroll px-8 pb-[12rem] items-start">
          <div>
            <p className="text-2xl font-light">
              Write down these words or you'll die!
            </p>
            <SeedWords words={words ?? ""} />
          </div>
          <div className="w-full">
            {nodes && nodes[0] ? (
              <>
                <p className="text-2xl font-light">Node Pubkey</p>
                <div className="flex items-center gap-4 w-full">
                  <pre className="w-full truncate md:w-max">
                        {nodes[0]}
                  </pre>
                  <Copy copyValue={nodes[0]} />
                </div>
              </>
            ) : (
              <button onClick={handleNewNode}>New Node</button>
            )}
          </div>
          {COMMIT_HASH && (
            <div>
              <p className="text-2xl font-light">Mutiny Version</p>
              <div className="flex items-center gap-4">
                <pre>
                  <code>{COMMIT_HASH}</code>
                </pre>
                <Copy copyValue={COMMIT_HASH} />
              </div>
            </div>
          )}
          <SettingStringsEditor />
          <div />
          <div />
          <div />
          <div />

          <div className="bg-red p-4 rounded w-full">
            <p className="text-2xl font-light text-white uppercase">
              Danger Zone
            </p>
          </div>

          <button onClick={handleClearState}>Clear State</button>

          <button onClick={handleSave}>Save State As File</button>

          <label className="fileInputButton">
            Upload Saved State
            <input
              className="fileInput"
              type="file"
              onChange={handleFileChoose}
            />
          </label>
        </div>
        <MutinyToaster />
        <ConfirmDialog
          open={dialogOpen}
          message={confirmMessage}
          onCancel={() => setDialogOpen(false)}
          onConfirm={confirmSettingsAction}
        />
      </main>
    </>
  );
}

export default Settings;
