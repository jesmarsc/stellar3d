import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import { useTransition, animated, config } from '@react-spring/web';
import { FaRegCopy, FaGlobeAmericas } from 'react-icons/fa';

import { KeyValueList } from '@components';
import { UIStoreContext } from '@stores/UIStore';

import classes from './InfoCard.module.css';

const InfoCard = observer(({ className }) => {
  const { selectedNode } = useContext(UIStoreContext);

  const transitions = useTransition(selectedNode, {
    key: selectedNode?.publicKey,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: config.stiff,
  });

  return transitions((style, item) => {
    return (
      item && (
        <animated.div
          style={style}
          className={`${classes.InfoCard} ${className}`}
        >
          <div className={classes.InfoCard__title}>
            <h1 className={classes.InfoCard__name}>
              {item.name || item.publicKey}
            </h1>
            <h2 className={classes.InfoCard__country}>
              <FaGlobeAmericas style={{ marginRight: '8px' }} />
              {item.geoData.countryName}
            </h2>
          </div>
          <hr
            className={classes.InfoCard__divider}
            style={{
              background: `linear-gradient(to right, ${
                item.active ? 'lime' : 'red'
              }, rgba(255, 255, 255, 0))`,
            }}
          />
          <KeyValueList
            entries={[
              [
                'Public Key',
                <div className={classes.InfoCard__publicKeyContainer}>
                  <span className={classes.InfoCard__publicKey}>
                    {item.publicKey}
                  </span>
                  <FaRegCopy
                    className={classes.InfoCard__copy}
                    onClick={() => {
                      navigator.clipboard.writeText(item.publicKey);
                    }}
                  />
                </div>,
              ],
              ['IP:Port', `${item.ip}:${item.port}`],
              ['Version', item.versionStr],
              ['Overlay Version', item.overlayVersion],
              ['Ledger Version', item.ledgerVersion],
              ['ISP', item.isp],
            ]}
          />
        </animated.div>
      )
    );
  });
});

export default InfoCard;
