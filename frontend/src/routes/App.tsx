
import logo from '../images/mutiny-logo.svg';
import { useNavigate } from "react-router-dom";
import More from '../components/More';
import MutinyToaster from '../components/MutinyToaster';
import { useContext } from 'react';
import { NodeManagerContext } from '@components/GlobalStateProvider';
import { useQueryClient } from '@tanstack/react-query';
import MainBalance from '@components/MainBalance';
import { mainWrapperStyle } from '../styles';

function App() {
  const { nodeManager } = useContext(NodeManagerContext);

  const queryClient = useQueryClient()

  let navigate = useNavigate();

  function handleNavSend() {
    navigate("/send")
  }

  function handleNavReceive() {
    navigate("/receive")
  }

  function handleNavSettings() {
    navigate("/manager/settings")
  }

  async function handleSync() {
    console.time("BDK Sync Time")
    console.groupCollapsed("BDK Sync")
    await nodeManager?.sync()
    console.groupEnd();
    console.timeEnd("BDK Sync Time")
    await queryClient.invalidateQueries({ queryKey: ['balance'] })
  }

  return (
    <>
      <header className='p-8 pt-8 flex justify-between items-center'>
        <img src={logo} className="App-logo" alt="logo" onClick={handleSync} />
        <More />
      </header>
      <main className={mainWrapperStyle()}>
        {nodeManager ?
          <>
            <div />
            <MainBalance />
            {nodeManager.get_network() === "bitcoin" &&
              <p className='text-2xl font-light text-red'>This is alpha software, please don't trust it with money you don't want to lose!</p>
            }
            <div />
            <div className='flex flex-col gap-2 items-start'>
              <button className='green-button' onClick={handleNavSend}>Send</button>
              {/* TODO if no funds can do deposit instead of receive */}
              {/* <button className='blue-button' onClick={handleNavDeposit}>Deposit</button> */}
              <div className='w-full flex justify-between items-center'>
                <button className='blue-button' onClick={handleNavReceive}>Receive</button>
              </div>
            </div>
          </>
          : <><div /><p className="text-2xl font-light">Loading...</p><div />
            <div className='flex flex-col gap-2 items-start'>
              <button onClick={handleNavSettings}>Settings</button>
            </div></>}
        <MutinyToaster />
      </main>
    </>
  );
}

export default App;
