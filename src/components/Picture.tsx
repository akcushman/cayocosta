import type { Channel } from "@/lib/channels";
import type { Phase } from "@/lib/useTV";
import HelloScreen from "./HelloScreen";
import StaticCanvas from "./StaticCanvas";
import styles from "./Picture.module.css";

export const pad = (n: number) => String(n).padStart(2, "0");

type Props = {
  phase: Phase;
  channel: Channel;
  osd: boolean;
  /** Extra static on top of a tuned picture, 0–1. */
  noise?: number;
  /** Hide the lower-third title card (e.g. while dial-tuning). */
  quiet?: boolean;
};

// What's on the tube: program, static, on-screen display and the glass.
// The parent provides the screen shape and must be a size container.
export default function Picture({ phase, channel, osd, noise = 0, quiet }: Props) {
  const burst = phase === "warming" || phase === "switching";

  return (
    <>
      {phase !== "off" && (
        <div className={styles.picture} data-phase={phase}>
          {phase !== "warming" && (
            <div className={styles.program} style={{ background: channel.color }}>
              <div className={styles.stationId}>AK·{pad(channel.number)}</div>
              {channel.home ? (
                <HelloScreen />
              ) : (
                <>
                  <h2 className={styles.title}>{channel.title}</h2>
                  <p className={styles.tagline}>{channel.tagline}</p>
                  <p className={styles.prompt}>▶ press OK to watch</p>
                </>
              )}
            </div>
          )}

          <div
            className={styles.staticWrap}
            data-visible={burst}
            data-live={noise > 0}
            style={burst ? undefined : { opacity: noise }}
          >
            <StaticCanvas className={styles.static} />
          </div>

          {phase === "on" && osd && (
            <>
              <div className={styles.osd} data-hold={noise > 0} key={`osd-${channel.slug}`}>
                CH {pad(channel.number)}
              </div>
              {!channel.home && !quiet && (
                <div className={styles.lowerThird} key={channel.slug}>
                  <span className={styles.lowerThirdNum}>{pad(channel.number)}</span>
                  <span className={styles.lowerThirdTitle}>{channel.title}</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
      <div className={styles.scanlines} />
      <div className={styles.glass} />
    </>
  );
}
