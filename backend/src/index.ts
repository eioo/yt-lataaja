import { EventType, WSQuery } from 'shared/websocket';
import WebSocket from 'ws';
import * as ytdl from 'ytdl-core';
import { debounce } from './debounce';
import { YTDL } from './YTDL';

function parseMessage(message: WebSocket.Data): WSQuery {
  try {
    const parsed: WSQuery = JSON.parse(message.toString());

    if (
      !Array.isArray(parsed) ||
      (Array.isArray(parsed) && parsed.length !== 2)
    ) {
      throw Error('Cant parse incoming WebSocket message');
    }

    return {
      event: parsed[0],
      query: parsed[1],
    };
  } catch (e) {
    throw Error('Cant parse incoming WebSocket message');
  }
}

/**
 * Starts WebSocket server and listens for in-coming messages
 *
 * @param port - Port of the server
 */
export function startWebSocketServer(port = process.env.WS_PORT) {
  const wss = new WebSocket.Server({ port: Number(port) || 1337 });

  wss.on('listening', () => {
    console.log(`WebSocket server listening on port: ${port}`);
  });

  wss.on('connection', (ws) => {
    const downloader = new YTDL();

    const send = (event: EventType, data?: unknown) =>
      ws.send(JSON.stringify([event, data]));

    const debouncedSend = debounce(
      (...params: Parameters<typeof send>) => send(...params),
      250
    );

    ws.on('message', async (message) => {
      const msg = parseMessage(message);

      if (msg.event === EventType.GetVideoInfo) {
        const { formats, videoDetails } = await ytdl.getInfo(
          msg.query.videoUrl
        );

        send(msg.event, {
          formats,
          videoDetails,
        });
      }

      if (msg.event === EventType.Download) {
        const {
          videoUrl,
          title,
          itag,
          lengthSeconds,
          outputExtension,
          cropStart,
          cropEnd,
        } = msg.query;

        downloader.download(videoUrl, {
          itag,
          outputExtension,
          cropStart,
          cropEnd,
          metaData: {
            title,
            lengthSeconds,
          },
        });

        // Send download progress to user
        downloader.on('progress', (percentage: number) =>
          debouncedSend(EventType.DownloadProgress, Math.round(percentage))
        );

        downloader.on('finished', (path) => {
          send(EventType.ConversionFinished, {
            path,
          });
        });
      }
    });
  });

  wss.on('close', () => {
    console.log('WebSocket server closed');
  });
}

startWebSocketServer();
