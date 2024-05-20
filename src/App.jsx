import { useEffect, useState } from "react";
import {
  Button,
  Container,
  CssBaseline,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import axios from "axios";
import {
  SignalWifi1Bar,
  SignalWifi1BarLock,
  SignalWifi2Bar,
  SignalWifi2BarLock,
  SignalWifi3Bar,
  SignalWifi3BarLock,
  SignalWifi4Bar,
  SignalWifi4BarLock,
} from "@mui/icons-material";
import theme from "./theme";
import { LoadingButton } from "@mui/lab";

function App() {
  const [wifiNetworks, setWifiNetworks] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const [completed, setCompleted] = useState(false);

  const [selectedNetwork, setSelectedNetwork] = useState(null);

  const [password, setPassword] = useState("");

  useEffect(() => {
    async function fetchData() {
      if (fetching) return;
      setFetching(true);
      const wifiNetworks = await axios.get("http://192.168.1.1:5000/scan");
      console.log(wifiNetworks);
      setWifiNetworks(wifiNetworks.data);
      setFetching(false);
    }
    fetchData();
  }, []);

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {!selectedNetwork && (
          <Grid container spacing={2} justifyContent={"center"}>
            <List>
              {wifiNetworks &&
                wifiNetworks.map((network) => (
                  <ListItem key={network.mac}>
                    <ListItemButton onClick={() => setSelectedNetwork(network)}>
                      <WifiStrengthIcon
                        signal={network.signal_level}
                        security={network.security}
                      />
                      {network.ssid}
                    </ListItemButton>
                  </ListItem>
                ))}
            </List>
          </Grid>
        )}
        {!completed && selectedNetwork && (
          <Grid container spacing={2} justifyContent={"center"}>
            <Grid item xs={12}>
              <Grid container spacing={2} justifyContent={"center"}>
                <Typography variant="h6">{selectedNetwork.ssid}</Typography>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2} justifyContent={"center"}>
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2} justifyContent={"center"}>
                <Grid item>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setSelectedNetwork(null)}
                  >
                    Cancel
                  </Button>
                </Grid>
                <Grid item>
                  <LoadingButton
                    variant="contained"
                    color="primary"
                    loading={connecting}
                    onClick={async () => {
                      try {
                        setConnecting(true);
                        const res = await axios.post(
                          "http://192.168.1.1:5000/wifiCreds",
                          {
                            ssid: selectedNetwork.ssid,
                            password,
                          }
                        );
                        setConnecting(false);
                        setCompleted(true);
                      } catch (error) {
                        console.error(error);
                        setConnecting(false);
                      }
                    }}
                  >
                    Connect
                  </LoadingButton>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
        {completed && (
          <Grid container spacing={2} justifyContent={"center"}>
            <Grid item xs={12}>
              <Typography variant="h3" sx={{ textAlign: "center" }}>
                Connected!
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ textAlign: "center" }}>
                You are now connected to the network.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ textAlign: "center" }}>
                You can now close this window, the GaragePi will restart
              </Typography>
            </Grid>
          </Grid>
        )}
      </ThemeProvider>
    </>
  );
}

export default App;

function WifiStrengthIcon({ signal, security }) {
  // Excellent (Full Strength): ≥ -50 dBm
  // Good: -50 dBm to -60 dBm
  // Fair: -60 dBm to -70 dBm
  // Weak: ≤ -70 dBm

  // security WPA2 - locked

  if (signal >= -50) {
    return (
      <ListItemIcon>
        {security === "WPA2-Personal" ? (
          <SignalWifi1BarLock sx={{ color: "#fff" }} />
        ) : (
          <SignalWifi1Bar sx={{ color: "#fff" }} />
        )}
      </ListItemIcon>
    );
  } else if (signal >= -60) {
    return (
      <ListItemIcon>
        {security === "WPA2-Personal" ? (
          <SignalWifi2BarLock sx={{ color: "#fff" }} />
        ) : (
          <SignalWifi2Bar sx={{ color: "#fff" }} />
        )}
      </ListItemIcon>
    );
  } else if (signal >= -70) {
    return (
      <ListItemIcon>
        {security === "WPA2-Personal" ? (
          <SignalWifi3BarLock sx={{ color: "#fff" }} />
        ) : (
          <SignalWifi3Bar sx={{ color: "#fff" }} />
        )}
      </ListItemIcon>
    );
  } else {
    return (
      <ListItemIcon>
        {security === "WPA2-Personal" ? (
          <SignalWifi4BarLock sx={{ color: "#fff" }} />
        ) : (
          <SignalWifi4Bar sx={{ color: "#fff" }} />
        )}
      </ListItemIcon>
    );
  }
}
