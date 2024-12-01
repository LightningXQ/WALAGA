import React, { useState, useEffect, useRef } from "react";
import "./Game.css";
import data from "../config/data.json";

const Game = () => {
  let hitDetected;
  
  // const [playerPosition, setPlayerPosition] = useState(50);
  const [enemyPosition, setEnemyPosition] = useState({ x: 50, y: 0 });
  const [bullets, setBullets] = useState([]);
  const [keyLeftPressed, setKeyLeftPressed] = useState(false);
  const [keyRightPressed, setKeyRightPressed] = useState(false);
  const [keySpacePressed, setKeySpacePressed] = useState(false);

  const playerPosition = useRef(50);

  const handleKeyDown = (event) => {
    if (event.code === "KeyA") { setKeyLeftPressed(true); }
    if (event.code === "KeyD") { setKeyRightPressed(true); }
    if (event.code === "Space") { setKeySpacePressed(true); }
  };

  const handleKeyUp = (event) => {
    if (event.code === "KeyA") { setKeyLeftPressed(false); }
    if (event.code === "KeyD") { setKeyRightPressed(false); }
    if (event.code === "Space") { setKeySpacePressed(false); }
  };

  const calcEnemyMove = (enemyX, playerX, clock, threshold) => {
    if ((playerX - enemyX) / clock > threshold) return threshold;
    else if ((playerX - enemyX) / clock < -threshold) return -threshold;
    else return (playerX - enemyX) / clock;
  }

  const isColliding = (bullet, enemy) => {
    const bulletLeft = bullet.x - data.BulletWidth / 2.0;
    const bulletRight = bullet.x + data.BulletWidth / 2.0;
    const bulletTop = bullet.y - data.BulletHeight / 2.0;
    const bulletBottom = bullet.y + data.BulletHeight / 2.0;

    const enemyLeft = enemy.x - data.EnemyWidth / 2.0;
    const enemyRight = enemy.x + data.EnemyWidth / 2.0;
    const enemyTop = enemy.y - data.EnemyHeight / 2.0;
    const enemyBottom = enemy.y + data.EnemyHeight / 2.0;

    return (
      !((bulletRight <= enemyLeft ||
      bulletLeft >= enemyRight) ||
      (bulletBottom <= enemyTop ||
      bulletTop >= enemyBottom))
    );
  }

  // useEffect(() => {
  //   playerPositionRef.current = playerPosition;
  // }, [playerPosition]);

  // EventListerHandler
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // PlayerMoveHandler
  useEffect(() => {
    const playerMoveInterval = setInterval(() => {
      if (keyLeftPressed && keyRightPressed) {  }
      else if (keyLeftPressed) { playerPosition.current = (0 > playerPosition.current - 1) ? 0 : playerPosition.current - 1; }
      else if (keyRightPressed) { playerPosition.current = (100 < playerPosition.current + 1) ? 100 : playerPosition.current + 1; }
    }, 10);

    return () => clearInterval(playerMoveInterval);
  }, [keyLeftPressed, keyRightPressed]);

  // PlayerBulletGenHandler
  useEffect(() => {
    const playerBulletGenInterval = setInterval(() => {
      if (keySpacePressed) { setBullets((prev) => [...prev, { x: playerPosition.current, y: 80 }]); }
    }, 100);

    return () => clearInterval(playerBulletGenInterval);
  }, [keySpacePressed])

  // PlayerBulletMoveHandler
  useEffect(() => {
    const playerBulletMoveInterval = setInterval(() => {
      setBullets((prev) =>
        prev
          .map((bullet) => ({ ...bullet, y: bullet.y - 1 }))
          .filter((bullet) => bullet.y > 0)
      );
    }, 7);

    return () => clearInterval(playerBulletMoveInterval);
  }, [])

  useEffect(() => {
    const enemyMoveInterval = setInterval(() => {
      setEnemyPosition((prev) => ({
        x: prev.x + calcEnemyMove(prev.x, playerPosition.current, 20, 2),
        y: (prev.y + 1 > 100) ? 0 : prev.y + 1,
      }));

    }, 20);

    return () => clearInterval(enemyMoveInterval);
  }, [])

  // 총알과 적 업데이트
  useEffect(() => {
    const enemyInterval = setInterval(() => {

      // 충돌 감지 (간단한 판정)
      setBullets((prevBullets) => {

        // 충돌 감지 및 처리
        hitDetected = false;
        const updatedBullets = prevBullets.filter((bullet) => {
          if (isColliding(bullet, enemyPosition)) {
            hitDetected = true;
            return false; // 충돌한 총알 제거
          }
          return true;
        });

        // 적 위치 리셋
        if (hitDetected) {
          setEnemyPosition({
            x: Math.random() * 100, // 새로운 적 위치 설정
            y: 5,
          });
        }

        return updatedBullets;
      });
    }, 5);

    return () => clearInterval(enemyInterval);
  }, [enemyPosition]);

  return (
    <div className="game-container">
      <div
        className="player"
        style={{
          left: `${playerPosition.current}%`,
          bottom: `10%`,
        }}
      ></div>
      <div
        className="enemy"
        style={{
          left: `${enemyPosition.x}%`,
          top: `${enemyPosition.y}%`,
        }}
      ></div>
      {bullets.map((bullet, index) => (
        <div
          key={index}
          className="bullet"
          style={{
            left: `${bullet.x}%`,
            top: `${bullet.y}%`,
          }}
        ></div>
      ))}
    </div>
  );
}

export default Game
